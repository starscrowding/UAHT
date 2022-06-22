import Document, {Html, Head, Main, NextScript, DocumentContext} from 'next/document';
import {CssBaseline} from '@nextui-org/react';

class SpaceDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps,
      styles: <>{initialProps.styles}</>,
    };
  }

  render() {
    return (
      <Html lang="en" style={{background: '#000000'}}>
        <Head>{CssBaseline.flush()}</Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default SpaceDocument;
