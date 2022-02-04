import { Icon } from '../Icon';
import {DateTime as Date} from 'luxon';

const DateTimeIcon = ({ name }) => {
  return <Icon className="mr-2 text-tertiary" name={name} />;
};

export const DateTime = ({ date }: { date: string }) => {
  const dateObj = Date.fromISO(date);
  return (
    <div className="flex w-3/4 border border-light rounded-lg text-secondary">
      <div className="flex p-2 border-r border-light">
        <DateTimeIcon name="calendar_today" />{' '}
        {dateObj.toFormat('DD')}
      </div>
      <div className="flex p-2">
        <DateTimeIcon name="schedule" />{' '}
        {dateObj.toFormat('t')}
      </div>
    </div>
  );
};
