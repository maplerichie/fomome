import styles from "./footer.module.css";

export default function Footer() {
  return (
    <div className={styles.footer}>
      <a href="https://github.com/maplerichie/fomome" target={"_blank"}>
        Leave a star on Github
      </a>
      <a href="https://alchemy.com/?a=create-web3-dapp" target={"_blank"}>
        <img
          id="badge-button"
          style={{ width: "240px", height: "53px" }}
          src="https://static.alchemyapi.io/images/marketing/badgeLight.png"
          alt="Alchemy Supercharged"
        />
      </a>
      <a href="https://twitter.com/maplerichie" target={"_blank"}>
        Follow me on Twitter
      </a>
    </div>
  );
}
