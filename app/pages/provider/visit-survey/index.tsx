import React from 'react';
import { CardLayout } from '../../../components/Provider';
import { VisitSurvey } from '../../../components/VisitSurvey';

const VisitSurveyPage = () => {
  return (
    <CardLayout>
      <VisitSurvey isProvider />
    </CardLayout>
  );
};

export default VisitSurveyPage;
