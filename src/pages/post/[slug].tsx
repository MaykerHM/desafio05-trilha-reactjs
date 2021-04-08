import { GetStaticPaths, GetStaticProps } from 'next';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { RichText } from 'prismic-dom'
import Prismic from '@prismicio/client'
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiUser, FiCalendar, FiClock } from "react-icons/fi";
import { IconContext } from 'react-icons'

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const readingTime = post.data.content.reduce((acc, content) => {
    return
  })
  return (
    <>
      <main className={ styles.Container }>
        <article>
          <img src={ post.data.banner.url } alt={ post.data.title } />
          <h1>{ post.data.title }</h1>
          <h2>{ post.data.subtitle }</h2>
          <div>
            <IconContext.Provider value={ { size: '1.5rem' } }>
              <p><span><FiCalendar /></span>{ post.first_publication_date }</p>
              <p><span><FiUser /></span>{ post.data.author }</p>
              <p><span><FiClock /></span>{ readingTime + ' min' }</p>
            </IconContext.Provider>
          </div>
          {
            post.data.content.map(content => {
              return (
                <div key={ content.heading }>
                  <h2>{ content.heading }</h2>
                  { RichText.asText(content.body) }
                </div>
              )
            })
          }
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.slug']
  });

  const paths = posts.results.map(
    post => {
      return {
        params: { slug: String(post.uid) }
      }
    }
  )



  return {
    paths, fallback: false
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post: Post = {
    uid: response.uid,
    first_publication_date:
      format(
        new Date(response.first_publication_date),
        "dd MMM y",
        {
          locale: ptBR,
        }
      ),
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: { url: response.data.banner.url },
      author: response.data.author,
      content: response.data.content,
    },
  }

  return {
    props: { post },
    revalidate: 60 * 30 // 30 min
  }
};
