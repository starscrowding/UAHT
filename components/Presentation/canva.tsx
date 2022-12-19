import {useState} from 'react';
import classNames from 'classnames';
import styles from './presentation.module.scss';

export const Canva = () => {
  const [loading, setLoading] = useState(true);

  return (
    <div className={classNames(styles.container, {[styles.loading]: loading})}>
      <iframe
        loading="lazy"
        className={styles.frame}
        src="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAFKy9llv80&#x2F;view?embed"
        allowFullScreen={true}
        allow="fullscreen"
        onLoad={() => setLoading(false)}
      ></iframe>
    </div>
  );
};
