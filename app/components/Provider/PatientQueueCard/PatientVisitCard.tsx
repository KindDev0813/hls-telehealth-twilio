import { TelehealthVisit } from "../../../types";
import { joinClasses } from "../../../utils"


export interface PatientVisitCardProps {
  visit: TelehealthVisit;
  index: number;
  waitTime: string;
  isOnDemand?: boolean; 
}

export const PatientVisitCard = ({visit, index, waitTime, isOnDemand = false}: PatientVisitCardProps) => {
  return (
    <div
      key={index}
      className={joinClasses(
        'grid grid-cols-2 gap-4 font-bold text-xs px-1 py-2',
        isOnDemand ? 'bg-[#eff6ff] border border-top-[#d4d4d4]' : index % 2 ? '' : 'bg-[#FAFAFA]'
      )}
    >
      <div>
        <a className="text-link underline">{visit.ehrPatient.name}</a>
        {isOnDemand && <span className="text-red-400"> (On Demand)</span>}
        <div className="font-bold text-light">
          { waitTime }
        </div>
      </div>
      <div className="line-clamp-2 overflow-ellipsis overflow-hidden text-dark">
        {visit.ehrAppointment.reason}
      </div>
    </div>
  )
}