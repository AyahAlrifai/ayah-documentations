import React from 'react';
import styles from '../../css/style.module.css';

const FeatureList = [
  {
    title: '',
    image: require('@site/static/img/2.png').default, // Use PNG image
    description: (
      <>
        Unleash the ultimate programming potential within you by exploring our comprehensive website documentation.
      </>
    ),
  },
  {
    title: '',
    image: require('@site/static/img/3.jpg').default, // Use JPG image
    description: (
      <>
        Elevate your coding prowess with our meticulously curated resources and tutorials, tailored to empower both beginners and seasoned developers alike.
      </>
    ),
  },
  {
    title: '',
    image: require('@site/static/img/1.png').default, // Use PNG image
    description: (
      <>
        Embark on the ultimate journey of knowledge acquisition and mastery in the realm of programming through our enriching online platform.
      </>
    ),
  },
  {
    title: '',
    image: require('@site/static/img/1.png').default, // Use PNG image
    description: (
      <>
        Embark on the ultimate journey of knowledge acquisition and mastery in the realm of programming through our enriching online platform.
      </>
    ),
  },
];

function Feature({ image, title, description }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column"
    }}>
      <div>
        <img src={image} alt={title} className={styles.featureSvg} />
      </div>
      <div style={{ color: "#ffffff", fontWeight: "bolder", fontSize: "1rem", textWrap: "pretty" }}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <div className={styles.cubeContainer}>
      <div className={styles.cube}>
        <div className={styles.face + ' ' + styles.top}></div>
        <div className={styles.face + ' ' + styles.bottom}></div>
        <div className={styles.face + ' ' + styles.left}><Feature key={0} {...FeatureList[0]} /></div>
        <div className={styles.face + ' ' + styles.right}><Feature key={1} {...FeatureList[1]} /></div>
        <div className={styles.face + ' ' + styles.front}><Feature key={2} {...FeatureList[2]} /></div>
        <div className={styles.face + ' ' + styles.back}><Feature key={3} {...FeatureList[3]} /></div>
      </div>
    </div>
  );
}