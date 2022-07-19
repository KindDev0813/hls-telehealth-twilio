import Head from 'next/head';
import Link from 'next/link';

const patientCoreVideoLinks = [
  { name: 'Waiting Room', href: '/patient/waiting-room' },
  { name: 'Left Waiting Room', href: '/patient/waiting-room/left' },
  { name: 'Video Consultation', href: '/patient/video' },
  { name: 'Disconnected', href: '/patient/video/disconnected' },
  { name: 'No Mic/Video Permissions', href: '/patient/video/no-av-permission' },
];

const patientOnDemandLinks = [
  { name: 'Info Form', href: '/patient/on-demand/info' },
  { name: 'Health Form', href: '/patient/on-demand/health' },
  { name: 'Insurance', href: '/patient/on-demand/insurance' },
  { name: 'Insurance Received', href: '/patient/on-demand/insurance/received' },
  { name: 'Payment', href: '/patient/on-demand/payment' },
  { name: 'Payment Received', href: '/patient/on-demand/payment/received' },
];

const providerCoreVideoLinks = [
  { name: 'Dashboard', href: '/provider/dashboard' },
  { name: 'Video Consultation', href: '/provider/video' },
  { name: 'Disconnected', href: '/provider/video/disconnected' },
  { name: 'Survey - Form', href: '/provider/visit-survey' },
  { name: 'Survey - Thank You', href: '/provider/visit-survey/thank-you' },
];

const invitedAttendeeVideoLinks = [
  { name: 'Invited Attendee', href: '/invited-attendee' },
  { name: 'Technical Check', href: '/invited-attendee/technical-check' },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Twilio</title>
        <meta name="description" content="Twilio Telehealth Application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="p-4">
        <h1 className="mb-4 text-2xl">Sitemap</h1>

        <h2 className="mb-2 text-xl">Patient Flow - Core Video</h2>
        <ul className="pl-4">
          {patientCoreVideoLinks.map((link, i) => (
            <li key={i}>
              <Link href={link.href}>
                <a className="text-blue-500">{link.name}</a>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 mb-2 text-xl">Patient Flow - Post Visit Surveys</h2>
        <ul className="pl-4">
          <li>
            <Link href="/patient/visit-survey">
              <a className="text-blue-500">Survey Form</a>
            </Link>
          </li>
          <li>
            <Link href="/patient/visit-survey/thank-you/">
              <a className="text-blue-500">Thank You</a>
            </Link>
          </li>
        </ul>

        <h2 className="mt-6 mb-2 text-xl">Patient Flow - On Demand</h2>
        <ul className="pl-4">
          {patientOnDemandLinks.map((link, i) => (
            <li key={i}>
              <Link href={link.href}>
                <a className="text-blue-500">{link.name}</a>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 mb-2 text-xl">Provider Flow - Core Video</h2>
        <ul className="pl-4">
          {providerCoreVideoLinks.map((link, i) => (
            <li key={i}>
              <Link href={link.href}>
                <a className="text-blue-500">{link.name}</a>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 mb-2 text-xl">Invited Attendee</h2>
        <ul className="pl-4">
          {invitedAttendeeVideoLinks.map((link, i) => (
            <li key={i}>
              <Link href={link.href}>
                <a className="text-blue-500">{link.name}</a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
