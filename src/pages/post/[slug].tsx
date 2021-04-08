import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client'

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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
  return (
    <>
      <main>
        <article>
          <img src={ post.data.banner.url } alt={ post.data.title } />
          <h1>{ post.data.title }</h1>
          <h2>{ post.data.subtitle }</h2>
          <div>
            <p>{ post.first_publication_date }</p>
            <p>{ post.data.author }</p>
          </div>
          {
            post.data.content.map(content => {
              return (
                <div key={ content.heading }>
                  <h2>{ content.heading }</h2>
                  { content.body.map(text => {
                    return (
                      <p key={ text.text }>{ text.text }</p>
                    )
                  }) }
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
    first_publication_date: new Date(response.first_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
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
