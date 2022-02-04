import React from 'react';
import { DisconnectedAlert } from '../../../components/DisconnectedAlert';
import { CardLayout } from '../../../components/Provider';

const DisconnectedPage = () => {
  return (
    <CardLayout>
      <DisconnectedAlert role={"provider"}/>
    </CardLayout>
  );
};

export default DisconnectedPage;
