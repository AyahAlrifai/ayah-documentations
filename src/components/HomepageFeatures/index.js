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
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
