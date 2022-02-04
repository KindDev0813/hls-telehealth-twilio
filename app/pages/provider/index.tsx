import { useRouter } from 'next/router';
import { useEffect } from 'react';
import practitionerAuth from '../../services/authService';
import clientStorage from '../../services/clientStorage';
import { STORAGE_USER_KEY } from '../../constants';

const PractitionerLanding = () => {
  const router = useRouter();
  useEffect(() => {
    var token = router.query.token as string;
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