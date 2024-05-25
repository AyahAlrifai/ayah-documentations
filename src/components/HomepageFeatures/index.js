import React from 'react';
import clsx from 'clsx';
import styles from '../../css/style.module.css';

const FeatureList = [
  {
    title: '',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Unleash the ultimate programming potential within you by exploring our comprehensive website documentation.
      </>
    ),
  },
  {
    title: '',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Elevate your coding prowess with our meticulously curated resources and tutorials, tailored to empower both beginners and seasoned developers alike.
      </>
    ),
  },
  {
    title: '',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Embark on the ultimate journey of knowledge acquisition and mastery in the realm of programming through our enriching online platform.
      </>
    ),
  },
  {
    title: '',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Embark on the ultimate journey of knowledge acquisition and mastery in the realm of programming through our enriching online platform.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column"
    }}>
      <div>
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div style={{ color: "#000000", fontWeight: "bolder", fontSize: "1rem", textWrap: "pretty" }}>
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
