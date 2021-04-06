import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client'

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
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
          <div>
            <p>{ post.first_publication_date }</p>
            <p>{ post.data.author }</p>
          </div>
          {
            post.data.content.map(content => {
              return (
                <div>
                  <h2>{ RichText.asText(content.heading) }</h2>
                  <p>{ RichText.asText(content.body) }</p>
                </div>
              )
            })
          }
        </article>
      </main>
    </>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.slug']
  });

  const paths = posts.map(
    post => {
      return {
        params: { slug: post.data.slug }
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

  const post = {
    first_publication_date: new Date(response.first_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    data: {
      title: RichText.asText(response.data.title),
      banner: { url: response.url },
      author: RichText.asText(response.data.author),
      content: response.data.content,
    },
  }

  return { props: { post } }
};
