const models = require('../models');
const { getOrInitSubscription } = require('./subscriptionController');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const RESUME_PRICE = 50; // ₹50 per resume

// POST /api/resume-builder/create-order
const createResumeOrder = async (req, res) => {
  try {
    // Plan gate: must be on a paid plan
    const userId = req.user.userId;
    const sub = await getOrInitSubscription(userId);
    const planName = sub.planName || 'free';

    if (planName === 'free') {
      return res.status(403).json({
        message: 'Resume Builder is a premium feature. Please upgrade to a paid plan first.'
      });
    }

    const { paymentMode } = req.body || {};
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const keysConfigured = keyId && keySecret && keyId !== 'your_razorpay_key_id';

    // If user explicitly chose mock payment OR if real keys are not available
    const isMock = paymentMode === 'mock' || !keysConfigured || process.env.MOCK_PAYMENTS === 'true';

    let order;
    if (!isMock) {
      const Razorpay = require('razorpay');
      const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
      order = await rzp.orders.create({
        amount: RESUME_PRICE * 100,
        currency: 'INR',
        receipt: `resume_${userId}_${Date.now()}`
      });
    } else {
      order = {
        id: `order_resume_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        amount: RESUME_PRICE * 100,
        currency: 'INR',
        receipt: `receipt_resume_mock_${Date.now()}`,
        status: 'created',
        mock: true
      };
    }

    res.json({
      order,
      keyId: isMock ? 'rzp_test_mock' : keyId,
      price: RESUME_PRICE,
      mockMode: isMock
    });
  } catch (error) {
    console.error('Create resume order error:', error);
    res.status(500).json({ message: 'Failed to create payment order.' });
  }
};

// POST /api/resume-builder/verify-payment
const verifyResumePayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, resumeData } = req.body;

    if (!razorpay_order_id || !resumeData) {
      return res.status(400).json({ message: 'Missing payment or resume details.' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Standard HMAC SHA256 verification when real Razorpay signature & secret are used
    if (keySecret && keySecret !== 'your_razorpay_key_secret' && !razorpay_order_id.startsWith('order_resume_mock_') && razorpay_signature) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment signature verification failed.' });
      }
    }

    // Generate PDF
    const pdfUrl = await generateResumePdf(resumeData, userId);

    // Normalize education & qualifications
    const legacyQualifications = (resumeData.qualifications && resumeData.qualifications.length > 0)
      ? resumeData.qualifications
      : (resumeData.education || []).map(e => `${e.degree || ''} - ${e.institution || ''} (${e.yearRange || ''})`).filter(Boolean);

    // Normalize experience & internships
    const legacyExperience = (resumeData.experience && resumeData.experience.length > 0)
      ? resumeData.experience
      : (resumeData.internships || []).map(i => ({
          company: i.organization || '',
          role: i.role || '',
          duration: i.duration || '',
          description: i.description || '',
          certificateLink: i.certificateLink || ''
        }));

    // Create GeneratedResume document
    const resumeDoc = await models.GeneratedResume.create({
      userId,
      fullName: resumeData.fullName,
      email: resumeData.email || '',
      personalInfo: resumeData.personalInfo || {},
      careerObjective: resumeData.careerObjective || '',
      education: resumeData.education || [],
      qualifications: legacyQualifications,
      experience: legacyExperience,
      skills: resumeData.skills || {},
      projects: resumeData.projects || [],
      internships: resumeData.internships || resumeData.experience || [],
      certifications: resumeData.certifications || [],
      achievements: resumeData.achievements || [],
      photoUrl: resumeData.photoUrl || '',
      generatedPdfUrl: pdfUrl,
      paymentId: razorpay_payment_id || `pay_resume_mock_${Date.now()}`
    });

    // Update StudentProfile's resumeUrl to the new generated resume
    await models.StudentProfile.findOneAndUpdate(
      { userId },
      { resumeUrl: pdfUrl }
    );

    res.json({
      message: 'Resume generated successfully!',
      resume: resumeDoc,
      pdfUrl
    });
  } catch (error) {
    console.error('Verify resume payment error:', error);
    res.status(500).json({ message: 'Failed to generate resume.' });
  }
};

// GET /api/resume-builder/my-resumes
const getMyResumes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const resumes = await models.GeneratedResume.find({ userId }).sort({ createdAt: -1 });
    res.json({ resumes });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ message: 'Failed to fetch resumes.' });
  }
};

// PDF generation using pdfkit (Professional multi-section format)
async function generateResumePdf(data, userId) {
  const PDFDocument = require('pdfkit');

  const uploadsDir = path.join(__dirname, '..', 'uploads', 'resumes');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `resume_${userId}_${Date.now()}.pdf`;
  const filePath = path.join(uploadsDir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Helper: Add Section Title with underline
    const addSectionHeader = (title) => {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0284c7')
         .text(title.toUpperCase(), { characterSpacing: 0.5 });
      doc.moveDown(0.2);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#cbd5e1').lineWidth(0.75).stroke();
      doc.moveDown(0.5);
    };

    // 1. Header: Name
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#0f172a')
       .text((data.fullName || 'Candidate').toUpperCase(), { align: 'center' });
    doc.moveDown(0.3);

    // Personal Info & Links Bar
    const personal = data.personalInfo || {};
    const contactParts = [];
    if (personal.address) contactParts.push(personal.address);
    if (personal.phone) contactParts.push(personal.phone);
    if (data.email) contactParts.push(data.email);
    if (personal.github) contactParts.push(`GitHub: ${personal.github}`);
    if (personal.linkedin) contactParts.push(`LinkedIn: ${personal.linkedin}`);
    if (personal.leetcode) contactParts.push(`Portfolio: ${personal.leetcode}`);

    if (contactParts.length > 0) {
      doc.fontSize(9).font('Helvetica').fillColor('#475569')
         .text(contactParts.join('  |  '), { align: 'center' });
    }

    doc.moveDown(0.6);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
    doc.moveDown(1.0);

    // 2. CAREER OBJECTIVE
    if (data.careerObjective && data.careerObjective.trim()) {
      addSectionHeader('CAREER OBJECTIVE');
      doc.fontSize(9.5).font('Helvetica').fillColor('#334155')
         .text(data.careerObjective.trim(), { align: 'justify', lineGap: 2 });
      doc.moveDown(1.2);
    }

    // 3. EDUCATION
    const eduList = (data.education && data.education.length > 0)
      ? data.education
      : (data.qualifications || []).map(q => ({ degree: q }));

    const validEdu = eduList.filter(e => e.degree || e.institution);
    if (validEdu.length > 0) {
      addSectionHeader('EDUCATION');
      validEdu.forEach(edu => {
        const leftText = [edu.degree, edu.institution].filter(Boolean).join('  |  ');
        const rightText = [edu.yearRange, edu.cgpa ? `CGPA/Marks: ${edu.cgpa}` : ''].filter(Boolean).join('  |  ');

        doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b');
        if (rightText) {
          doc.text(leftText, { continued: true });
          doc.fontSize(9).font('Helvetica-Oblique').fillColor('#64748b')
             .text(`  (${rightText})`, { align: 'left' });
        } else {
          doc.text(leftText);
        }
        doc.moveDown(0.35);
      });
      doc.moveDown(1.2);
    }

    // 4. SKILLS & EXPERTISE
    const skills = data.skills || {};
    const hasSkills = skills.languages || skills.tools || skills.frameworks || skills.other;
    if (hasSkills) {
      addSectionHeader('SKILLS & EXPERTISE');
      const skillRows = [
        { label: 'Core Skills', val: skills.languages },
        { label: 'Tools & Software', val: skills.tools },
        { label: 'Frameworks / Methods', val: skills.frameworks },
        { label: 'Other Skills', val: skills.other }
      ].filter(r => r.val && r.val.trim());

      skillRows.forEach(row => {
        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#1e293b')
           .text(`${row.label}: `, { continued: true })
           .font('Helvetica').fillColor('#334155')
           .text(row.val.trim());
        doc.moveDown(0.3);
      });
      doc.moveDown(1.2);
    }

    // 5. PROJECTS
    const validProjects = (data.projects || []).filter(p => p.title && p.title.trim());
    if (validProjects.length > 0) {
      addSectionHeader('PROJECTS & INITIATIVES');
      validProjects.forEach(proj => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b')
           .text(proj.title.trim(), { continued: Boolean(proj.techStack || proj.link) });

        if (proj.techStack || proj.link) {
          const meta = [proj.techStack, proj.link].filter(Boolean).join('  |  ');
          doc.fontSize(9).font('Helvetica-Oblique').fillColor('#64748b')
             .text(`  [ ${meta} ]`);
        } else {
          doc.text('');
        }

        if (proj.description) {
          const descLines = Array.isArray(proj.description)
            ? proj.description
            : String(proj.description).split('\n').map(l => l.trim()).filter(Boolean);

          descLines.forEach(line => {
            const cleanLine = line.startsWith('•') ? line.substring(1).trim() : line;
            doc.fontSize(9).font('Helvetica').fillColor('#334155')
               .text(`•  ${cleanLine}`, { indent: 10, lineGap: 1.5 });
          });
        }
        doc.moveDown(0.4);
      });
      doc.moveDown(1.2);
    }

    // 6. EXPERIENCE & INTERNSHIPS
    const rawInternships = (data.internships && data.internships.length > 0)
      ? data.internships
      : (data.experience || []);

    const validInternships = rawInternships.filter(i => (i.organization || i.company || i.role));
    if (validInternships.length > 0) {
      addSectionHeader('EXPERIENCE & INTERNSHIPS');
      validInternships.forEach(item => {
        const org = item.organization || item.company || '';
        const role = item.role || '';
        const duration = item.duration || '';

        doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b')
           .text([role, org].filter(Boolean).join(' — '), { continued: Boolean(duration) });

        if (duration) {
          doc.fontSize(9).font('Helvetica-Oblique').fillColor('#64748b')
             .text(`  (${duration})`);
        } else {
          doc.text('');
        }

        if (item.description) {
          const descLines = Array.isArray(item.description)
            ? item.description
            : String(item.description).split('\n').map(l => l.trim()).filter(Boolean);

          descLines.forEach(line => {
            const cleanLine = line.startsWith('•') ? line.substring(1).trim() : line;
            doc.fontSize(9).font('Helvetica').fillColor('#334155')
               .text(`•  ${cleanLine}`, { indent: 10, lineGap: 1.5 });
          });
        }

        if (item.certificateLink) {
          doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#0284c7')
             .text(`Certificate: ${item.certificateLink}`, { indent: 10 });
        }
        doc.moveDown(0.4);
      });
      doc.moveDown(1.2);
    }

    // 7. CERTIFICATIONS
    const validCerts = (data.certifications || []).filter(c => c.name && c.name.trim());
    if (validCerts.length > 0) {
      addSectionHeader('CERTIFICATIONS');
      validCerts.forEach(c => {
        const text = [c.name.trim(), c.issuer ? c.issuer.trim() : ''].filter(Boolean).join(' – ');
        doc.fontSize(9).font('Helvetica').fillColor('#334155')
           .text(`•  ${text}`, { indent: 10 });
        doc.moveDown(0.3);
      });
      doc.moveDown(1.2);
    }

    // 8. KEY ACHIEVEMENTS
    const validAchievements = (data.achievements || []).map(a => String(a).trim()).filter(Boolean);
    if (validAchievements.length > 0) {
      addSectionHeader('KEY ACHIEVEMENTS');
      validAchievements.forEach(ach => {
        const cleanAch = ach.startsWith('•') ? ach.substring(1).trim() : ach;
        doc.fontSize(9).font('Helvetica').fillColor('#334155')
           .text(`•  ${cleanAch}`, { indent: 10 });
        doc.moveDown(0.3);
      });
      doc.moveDown(1.2);
    }

    // Footer
    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
    doc.moveDown(0.4);
    doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
       .text('Generated by InternConnect Resume Builder', { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      const publicUrl = `/uploads/resumes/${filename}`;
      resolve(publicUrl);
    });
    stream.on('error', reject);
  });
}

module.exports = {
  createResumeOrder,
  verifyResumePayment,
  getMyResumes
};

