import { useState } from 'react';
import { HealthInfo } from '../../../interfaces';
import { Button } from '../../Button';
import { Form } from '../../Form';
import { Icon } from '../../Icon';
import { Textarea } from '../../Textarea';

export interface HealthFormProps {
  onSubmit?: (value: any) => void;
}

export const HealthForm = ({ onSubmit }: HealthFormProps) => {
  const [conditions, setConditions] = useState('');
  const [medications, setMedications] = useState('');
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState([{ name: 'Attached_File_Name.jpg' }]);

  function submit(_event: any) {
    onSubmit({
      conditions,
      medications,
      reason,
      files,
    } as HealthInfo);
  }

  return (
    <Form className="flex flex-col h-full px-4" onSubmit={submit}>
      <p className="text-center text-dark">
        Tell the doctor a little more about why you’re visiting today
      </p>
        <Textarea className="my-2" placeholder="Preexisting Conditions" setText={setConditions} required/>
        <Textarea className="my-2" placeholder="Current Medications" setText={setMedications} required/>
        <Textarea className="my-2" placeholder="Reason for visit (symptoms, etc - this is optional)" setText={setReason}/>
      <div>
        <p className="my-3 text-dark">
          Would you like to share a file, such as a photo, form, or test result?
        </p>
        <div className="mx-auto max-w-[300px]">
          {files.map((file, i) => (
            <a
              key={i}
              className="flex rounded-lg my-3 border border-link py-3 px-4 text-link text-xs items-center cursor-pointer"
              download
            >
              <span className="flex-grow underline">{file.name}</span>
              <Icon name="close" outline />
            </a>
          ))}
          <a className="text-link text-xs flex items-center">
            <Icon name="add" outline /> Attach a File
          </a>
        </div>
      </div>
      <div className="mt-5 text-center">
        <label className="text-light">
          <input type="checkbox" />{' I agree to the Terms & Conditions'}
        </label>
      </div>
      <div className="my-5 mx-auto max-w-[250px] w-full">
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </div>
    </Form>
  );
};
