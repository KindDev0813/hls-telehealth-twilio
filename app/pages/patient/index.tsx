import { useRouter } from 'next/router';
import { useEffect } from 'react';
import patientAuth from '../../services/authService';
import datastoreService from '../../services/datastoreService';
import clientStorage from '../../services/clientStorage';
import { STORAGE_USER_KEY, STORAGE_VISIT_KEY } from '../../constants';

const PatientLanding = () => {
  const router = useRouter();
  useEffect( () => {
    var token = router.query.token as string;
    if(token) {
      patientAuth.authenticateVisitorOrPatient(token)
      .then((u) => {

        clientStorage.saveToStorage(STORAGE_USER_KEY, u);

        async function _fetchFromServer() {
          const v = await datastoreService.fetchTelehealthVisitForPatient(u, u.visitId);
          return v;
        }
        return _fetchFromServer();

      }).then((v) => {
        if (v) {
          clientStorage.saveToStorage(STORAGE_VISIT_KEY, v);
          router.push('/patient/waiting-room');
        }
      // }).catch(err => {
      //   console.log(err);
      //   router.push('/404');
      });
    }
  }, [router]);

  return (
    <p>Please wait! You will be redirected to a call shortly.</p>
  );
};

export default PatientLanding;