import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const TRACKING_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

if (TRACKING_ID) {
  ReactGA.initialize(TRACKING_ID);
}

export default function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (TRACKING_ID) {
      ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
    }
  }, [location]);

  return null;
}
