import useBaseUrl from '@docusaurus/useBaseUrl';
import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

type FeatureItem = {
    title: string;
    image: string;
    description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
    {
        title: 'Free & Open-source',
        image: '/img/fr-opensource.png',
        description: (
        <>
          It does it's job, free of charge. 
        </>
      )
    },
    {
        title: 'Effecient asset packing',
        image: '/img/fr-packing.png',
        description: (
        <>
          Using Max-rect algorithm, Atlasify achieved effecient asset packing including:<br></br>
          bitmap(JPG, PNG etc.), vectors(SVG, MSDF etc.) 
        </>
      )
    },
    {
        title: 'CLI & NPM Module',
        image: '/img/fr-cli.png',
        description: (
        <>
            You can use it immediately using <br></br>
            <code>npm i -g atlasify</code> <br></br>
            Or, you can import it as a module.
        </>
      )
    }
];

function Feature ({ title, image, description }: FeatureItem) {
    return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img
          className={styles.featureSvg}
          alt={title}
          src={useBaseUrl(image)}
        />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
    );
}

export default function HomepageFeatures (): JSX.Element {
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
