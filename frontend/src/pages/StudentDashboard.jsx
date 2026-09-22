import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StudentDashboardLive from '../components/StudentDashboardLive';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [profileRes, appsRes, listingsRes] = await Promise.all([
          api.get('/students/me'),
          api.get('/students/me/applications'),
          api.get('/listings?limit=4')
        ]);

        setProfile(profileRes.data.profile);
        setApplications(appsRes.data.applications || []);
        setRecommended(listingsRes.data.listings || []);
      } catch (err) {
        console.error('Error loading candidate dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const countApplied = applications.filter(a => !a.status || a.status === 'applied' || a.status === 'pending').length;
  const countShortlisted = applications.filter(a => a.status === 'shortlisted').length;
  const countHired = applications.filter(a => a.status === 'hired').length;
  const countSaved = profile?.savedListings?.length || 0;

  // Profile Completeness calculation (Accurately reflects filled-in candidate profile fields up to 100%)
  let completeness = 0;
  if (user?.name || user?.email) completeness += 10;
  if (profile?.college && profile.college !== 'N/A') completeness += 15;
  if (profile?.degree && profile.degree !== 'N/A') completeness += 15;
  if (profile?.graduationYear) completeness += 15;
  if (profile?.location && profile.location !== 'N/A') completeness += 15;
  if (profile?.skills && profile.skills.length > 0) completeness += 15;
  if (profile?.resumeUrl) completeness += 15;
  if (completeness > 100) completeness = 100;

  const handleAction = (actionKey) => {
    switch (actionKey) {
      case 'home':
        navigate('/');
        break;
      case 'resume-builder':
      case 'tailor-resume':
        navigate('/resume-builder');
        break;
      case 'explore':
        navigate('/browse');
        break;
      case 'complete-profile':
        navigate('/profile');
        break;
      case 'view-applications':
      case 'view-shortlisted':
      case 'view-hired':
        navigate('/my-applications');
        break;
      case 'view-saved':
        navigate('/saved-jobs');
        break;
      case 'quick-apply-1':
      case 'quick-apply-2':
        navigate('/browse');
        break;
      default:
        if (actionKey?.startsWith('apply-')) {
          const id = actionKey.replace('apply-', '');
          navigate(`/listings/${id}`);
        }
        break;
    }
  };

  return (
    <StudentDashboardLive
      userName={user?.name || "Candidate"}
      profileCompletion={completeness || 75}
      initialStats={{
        applied: countApplied,
        shortlisted: countShortlisted,
        hired: countHired,
        saved: countSaved
      }}
      applications={applications}
      recommended={recommended}
      onExplore={() => navigate('/browse')}
      onAction={handleAction}
    />
  );
};

export default StudentDashboard;
