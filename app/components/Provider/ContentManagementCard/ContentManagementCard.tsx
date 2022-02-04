import { Card } from '../../Card';
import { CardHeading } from '../CardHeading';
import { Select } from '../../Select';
import {EHRContent} from "../../../types";
import {joinClasses} from "../../../utils";
import {useState} from "react";
import {useVisitContext} from "../../../state/VisitContext";
import datastoreService from "../../../services/datastoreService";
import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';

export interface ContentManagementCardProps {
  className?: string;
  contentAssigned: EHRContent;
  contentAvailable: EHRContent[];
}

export const ContentManagementCard = ({
    className,
    contentAssigned,
    contentAvailable,
}: ContentManagementCardProps) => {

  const { user } = useVisitContext();

  async function selectContent(content_id) {
    console.log(`'assigning content (${content_id}) to provider (${user.id})`);
    await datastoreService.assignContentToProvider(content_id, user);
  }

  return (
    <Card className={className}>
      <CardHeading>Content Management</CardHeading>
      {contentAvailable.length ? 
        <div className="px-2">
          <p className="mt-5 text-dark">
            Select content you’d like to play in the waiting room below:
          </p>
            <select
                onChange={(e) => selectContent(e.target.value) }
                className="block w-full my-3 mx-auto px-3 py-2 border border-light rounded-md text-dark"
            >
            { contentAvailable && (contentAvailable.map((c) => (<option key={c.id} value={c.id}>{c.title}</option>)))}
            </select>
            
        </div> : 
        <LoadingSpinner/>
      }
    </Card>
  );
};
