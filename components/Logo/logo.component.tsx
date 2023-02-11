import Link from 'next/link';
import {Text} from '@nextui-org/react';

export const Logo = ({
  className,
  href = '/',
  size = 50,
  target,
}: {
  className?: string;
  href?: string;
  size?: number;
  target?: string;
}) => {
  return (
    <Link href={href} className={className} target={target}>
      <Text
        h1
        css={{
          display: 'inline',
          textGradient: '45deg, $yellow500 50%, $blue500 50%',
        }}
        weight="bold"
        size={size}
      >
        UAHT
      </Text>
    </Link>
  );
};
