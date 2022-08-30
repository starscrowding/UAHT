import styles from './presentation.module.scss';

export const Canva = () => {
  return (
    <div className={styles.container}>
      <iframe
        loading="lazy"
        className={styles.frame}
        src="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAFKy9llv80&#x2F;view?embed"
        allowFullScreen={true}
        allow="fullscreen"
      ></iframe>
    </div>
  );
};
