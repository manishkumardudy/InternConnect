// Navbar ke saare links yahin ek jagah define hain.
// Naya link jodna ho to bas yahan ek line add karo.

// Upar ki main bar me dikhne wale links
export function getMainLinks(user, t) {
  const links = [{ to: '/browse', label: t('nav.browse') }];

  if (user) {
    links.push({ to: '/public-space', label: t('nav.publicSpace') });
  }
  if (user?.role === 'student') {
    links.push(
      { to: '/student-dashboard', label: t('nav.studentDashboard') },
      { to: '/my-applications', label: t('nav.myApplications') }
    );
  }
  if (user?.role === 'recruiter') {
    links.push(
      { to: '/recruiter-dashboard', label: t('nav.recruiterDashboard') },
      { to: '/post-listing', label: t('nav.postListing') }
    );
  }
  return links;
}

// Profile dropdown (aur mobile menu) me dikhne wale links
export function getMenuLinks(user, t) {
  const links = [];

  if (user?.role === 'student') {
    links.push(
      { to: '/profile', label: t('nav.myProfile') },
      { to: '/saved-jobs', label: t('nav.savedJobs') },
      { to: '/resume-builder', label: t('nav.resumeBuilder') },
      { to: '/subscription', label: t('nav.subscription') }
    );
  }
  if (user?.role === 'recruiter') {
    links.push({ to: '/company-profile', label: t('nav.companyProfile') });
  }
  if (user) {
    links.push({ to: '/login-history', label: t('nav.loginHistory') });
  }
  links.push({ to: '/help', label: t('nav.help') });
  return links;
}
