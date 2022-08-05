import { merge } from "lodash";
import { createPage, PageOptions, Plugin } from "vuepress";
import { excludePages } from "../../client/utils/constants";
import { Post } from "../../shared/models/groups";

const defaultGroupPageOptions = {
  frontmatter: {
    group: true,
  },
  content: "Generated by `vuepress-plugin-groups`.",
} as PageOptions;

export function groupsPlugin() {
  let pagesData: Record<string, Post>;

  return {
    name: "vuepress-plugin-groups",

    extendsPageOptions(options) {
      if (options.frontmatter?.group) {
        // options.frontmatter.layout = "GroupLayout";
      }
    },

    async onInitialized(app) {
      pagesData = Object.fromEntries(
        app.pages
          .filter((page) => ![...excludePages].includes(page.path))
          .map((page) => [page.path, page as unknown as Post])
      );

      for (const [_, page] of Object.entries(pagesData)) {
        if (!pagesData["/"]) {
          app.pages.push(
            (pagesData["/"] = (await createPage(
              app,
              merge({}, defaultGroupPageOptions, {
                frontmatter: {
                  title: "HOME PAGE",
                  group: false,
                },
                path: "/",
              })
            )) as unknown as Post)
          );
        }
        let parentPage = pagesData["/"];

        const pathList = page.path.split("/").filter((p) => !!p);

        let currentPath = "/";
        for (const child of pathList) {
          currentPath += child;
          const isPage = currentPath.endsWith(".html");
          if (!isPage) {
            currentPath += "/";
            if (!pagesData[currentPath]) {
              app.pages.push(
                (pagesData[currentPath] = (await createPage(
                  app,
                  merge({}, defaultGroupPageOptions, {
                    frontmatter: {
                      title: child,
                    },
                    path: currentPath,
                  })
                )) as unknown as Post)
              );
            }
          }
          pagesData[currentPath].routeMeta.parentGroup = parentPage.key;
          if (!isPage) {
            parentPage = pagesData[currentPath];
          }
        }
      }
    },
  } as Plugin;
}