import { Card } from '../../Card';
import { Layout } from '../Layout';

export interface CardLayoutProps {
  children: React.ReactNode;
}

export const CardLayout = ({ children }: CardLayoutProps) => {
  return (
    <Layout>
      <div className="flex flex-col justify-center min-h-full">
        <Card className="max-w-lg py-10">{children}</Card>
      </div>
    </Layout>
  );
};
