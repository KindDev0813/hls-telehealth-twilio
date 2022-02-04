import router, { useRouter } from "next/router";
import useVideoContext from "../Base/VideoProvider/useVideoContext/useVideoContext";
import { Button } from "../Button";
import { Modal } from "../Modal"

export interface EndCallModalProps {
  close: () => void;
  isVisible: boolean;
  isProvider: boolean;
}

export const EndCallModal = ({ close, isVisible, isProvider = false }: EndCallModalProps) => {
  const { room } = useVideoContext();
  const router = useRouter();

  function endCall() {
    console.log("EndedCall");
    close();
    room.disconnect();
    isProvider ? router.push('/provider/visit-survey/') : router.push('/patient/visit-survey/');
  }

  return (
    <Modal backdropClick={close} isVisible={isVisible}>
      <div className="mb-3 border-b border-border-primary">
        <h3 className="my-3 px-5">{isProvider ? "End Call for all participants?" : "End Call?"}</h3>
      </div>
      <div className="flex mb-5 mx-5 items-center justify-center">
        <div className="mx-2">
          <Button onClick={endCall}>
            {isProvider ? "End Session" : "Leave Call"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
