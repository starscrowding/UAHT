import Link from 'next/link';
import {FaInfoCircle} from 'react-icons/fa';
import {Text, Popover} from '@nextui-org/react';

export const Info = ({
  text,
  link,
  className,
  icon,
}: {
  text?: any;
  link?: string;
  className?: string;
  icon?: any;
}) => {
  return text ? (
    <Popover placement="top">
      <Popover.Trigger>
        <div className={className}>{icon ? icon : <FaInfoCircle color="white" />}</div>
      </Popover.Trigger>
      <Popover.Content>
        <Text css={{p: '$10'}}>{text}</Text>
      </Popover.Content>
    </Popover>
  ) : link ? (
    <Link href={link} className={className} target="_blank">
      <FaInfoCircle color="white" />
    </Link>
  ) : null;
};
