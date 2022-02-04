/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Alert } from '../../../../components/Alert';
import { Layout } from '../../../../components/Patient';

const InsuranceReceivedPage = () => {
  return (
    <Layout>
      <Alert
        title="Insurance Received"
        icon={<img alt="Insurance Received" src="/icons/person-check.svg" height={98} width={135} />}
        contentBeforeIcon
        content={
          <>
            <p className="mb-6">
              We’ve received your insurance information, and will be using it to
              process this visit.
            </p>
          </>
        }
      />
    </Layout>
  );
};

export default InsuranceReceivedPage;
