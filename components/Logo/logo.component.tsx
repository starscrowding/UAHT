import Link from 'next/link';
import {Text} from '@nextui-org/react';

export const Logo = ({
  className,
  href = '/',
  size = 50,
}: {
  className?: string;
  href?: string;
  size?: number;
}) => {
  return (
    <Link href={href}>
      <a className={className}>
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
      </a>
    </Link>
  );
};
