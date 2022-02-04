import React from 'react';
import { DisconnectedAlert } from '../../../components/DisconnectedAlert';
import { Layout } from '../../../components/Patient';

const DisconnectedPage = () => {
  return (
    <Layout>
      <DisconnectedAlert role={"provider"}/>
    </Layout>
  );
};

export default DisconnectedPage;
