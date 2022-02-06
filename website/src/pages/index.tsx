import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import HomepageFeatures from '../components/HomepageFeatures';
import useBaseUrl from '@docusaurus/useBaseUrl';

function HomepageHeader () {
    const { siteConfig } = useDocusaurusContext();
    return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <img
          className={styles.logoSvg}
          src={useBaseUrl('/img/title.svg')}
          alt={siteConfig.title}
        />
        {/* <h1 className="hero__title">{siteConfig.title}</h1> */}
        {/* <p className="hero__subtitle">{siteConfig.tagline}</p> */}
        <div className={clsx('container', styles.buttonsLine)}>
          <div className='row'>
            <div className={clsx('col col--6', styles.buttons)}>
              <Link
                className={clsx("button button--secondary button--lg", styles.button)}
                to="/docs/">
                Readme
              </Link>
            </div>
            <div className={clsx('col col--6', styles.buttons)}>
              <Link
                className={clsx("button button--secondary button--lg", styles.button)}
                to="/docs/modules">
                API Reference
              </Link>
            </div>
          </div>
        </div>
        
      </div>
    </header>
    );
}

export default function Home (): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
    );
}
