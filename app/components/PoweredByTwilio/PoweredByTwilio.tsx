/* eslint-disable @next/next/no-img-element */
export interface PoweredByTwilioProps {
  className?: string;
  inverted?: boolean;
}

export const PoweredByTwilio = ({
  className,
  inverted,
}: PoweredByTwilioProps) => {
  return inverted ? (
    <img
      alt="Powered by Twilio (white)"
      className={className}
      src="/powered-by-twilio-white.svg"
      width={126}
      height={19}
    />
  ) : (
    <img
      alt="Powered by Twilio"
      className={className}
      src="/powered-by-twilio.svg"
      width={150}
      height={40}
    />
  );
};
