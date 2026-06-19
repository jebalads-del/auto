import fg from 'fast-glob';
import { Route } from './+types/not-found';
import { useNavigate } from 'react-router';
import { useCallback, useEffect, useState } from 'react';

export async function loader({ params }) { // تم تصحيح هذا السطر
  const matches = await fg('src/**/page.{js,jsx,ts,tsx}');
  return {
    path: `/${params['*']}`,
    pages: matches
      .sort((a, b) => a.length - b.length)
      .map((match) => {
        const url = match.replace('src/app', '').replace(/\/page\.(js|jsx|ts|tsx)$/, '') || '/';
        const path = url.replaceAll('[', '').replaceAll(']', '');
        const displayPath = path === '/' ? 'Homepage' : path;
        return { url, path: displayPath };
      }),
  };
}

// تم حذف: interface ParentSitemap { webPages?: Array; } (كان يسبب مشاكل)

export default function CreateDefaultNotFoundPage({ loaderData }) { // تم تصحيح هذا السطر
  const [siteMap, setSitemap] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      const handler = (event: MessageEvent) => {
        if (event.data.type === 'sandbox:sitemap') {
          window.removeEventListener('message', handler);
          setSitemap(event.data.sitemap);
        }
      };

      window.parent.postMessage(
        {
          type: 'sandbox:sitemap',
        },
        '*'
      );
      window.addEventListener('message', handler);

      return () => {
        window.removeEventListener('message', handler);
      };
    }
  }, []);
  const missingPath = loaderData.path.replace(/^\//, '');
  const existingRoutes = loaderData.pages.map((page) => ({
    path: page.path,
    url: page.url,
  }));

  const handleBack = () => {
    navigate('/');
  };

  const handleSearch = (value: string) => {
    if (!siteMap) {
      const path = `/${value}`;
      navigate(path);
    } else {
      navigate(value);
    }
  };

  const handleCreatePage = useCallback(() => {
    window.parent.postMessage(
      {
        type: 'sandbox:web:create',
        path: missingPath,
        view: 'web',
      },
      '*'
    );
  }, [missingPath]);

  return (
    <>
      <div className="flex flex-col items-center justify-center p-8 space-y-8 text-center bg-white rounded-lg shadow-md max-w-lg mx-auto">
        <div className="text-xl font-bold text-gray-800">
          <div className="flex items-center justify-center">
            <span className="text-4xl text-blue-500 mr-2">!</span>
            <span>404 - Page Not Found</span>
          </div>
        </div>
        <p className="text-gray-600">
          Uh-oh! This page doesn't exist (yet).
        </p>
        <p className="text-gray-500">
          Looks like "/{missingPath}" isn't part of your project.
          But no worries, you've got options!
        </p>

        <div className="w-full">
          <button
            onClick={handleCreatePage}
            className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Create Page
          </button>
        </div>

        <p className="text-gray-500">
          Check out all your project's routes here ↓
        </p>

        {siteMap ? (
          <div className="flex flex-col space-y-4 w-full">
            {siteMap.webPages?.map((route) => (
              <button
                onClick={() => handleSearch(route.cleanRoute || '')}
                key={route.id}
                className="flex flex-row justify-between text-center items-center p-4 rounded-lg bg-white shadow-sm w-full hover:bg-gray-50"
              >
                {route.name}
                {route.cleanRoute}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 w-full">
            {existingRoutes.map((route) => (
              <button
                key={route.path}
                onClick={() => handleSearch(route.url.replace(/^\//, ''))}
                className="h-full w-full rounded-[8px] bg-gray-50 bg-cover"
              >
                {route.path}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
