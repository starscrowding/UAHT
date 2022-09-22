import Link from 'next/link';
import {FaInfoCircle} from 'react-icons/fa';
import {Text, Popover} from '@nextui-org/react';

export const Info = ({text, link, className}: {text?: any; link?: string; className?: string}) => {
  return text ? (
    <Popover placement="top">
      <Popover.Trigger>
        <div className={className}>
          <FaInfoCircle color="white" />
        </div>
      </Popover.Trigger>
      <Popover.Content>
        <Text css={{p: '$10'}}>{text}</Text>
      </Popover.Content>
    </Popover>
  ) : link ? (
    <Link href={link}>
      <a className={className} target="_blank">
        <FaInfoCircle color="white" />
      </a>
    </Link>
  ) : null;
};