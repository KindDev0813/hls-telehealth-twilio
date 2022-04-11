import { useRouter } from 'next/router';
import { useEffect } from 'react';
import practitionerAuth from '../../services/authService';
import clientStorage from '../../services/clientStorage';
import { FLEX_AGENT_NAME_KEY, FLEX_ENABLED_KEY, STORAGE_USER_KEY } from '../../constants';

const PractitionerLanding = () => {
  const router = useRouter();
  useEffect(() => {
    const token = router.query.token as string;
    const flexEnabled = Number(router.query.flex_enabled as string);
    const agentName = router.query.name as string;
    
    if (flexEnabled && flexEnabled === 1) {
      console.log("Do Flex Stuff");
      clientStorage.saveToStorage(FLEX_ENABLED_KEY, flexEnabled);
      if (agentName) {
        clientStorage.saveToStorage(FLEX_AGENT_NAME_KEY, agentName);
      }
    }

    if(token) {
      practitionerAuth.authenticatePractitioner(token)
      .then((providerUser) => {
        clientStorage.saveToStorage(STORAGE_USER_KEY, providerUser);
        router.push('/provider/dashboard');
      // }).catch(err => {
      //   console.log(err);
      //   router.push('/404');
      });
    }
  }, [router]);

  return (
    <p>Please wait Provider Person! You will be redirected to the Dashboard</p>
  );
};

export default PractitionerLanding;