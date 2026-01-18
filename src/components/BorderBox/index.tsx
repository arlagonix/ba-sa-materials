import styles from "./styles.module.css";

const BorderBox = ({ children }) => {
  return <div className={styles.box}>{children}</div>;
};

export default BorderBox;
