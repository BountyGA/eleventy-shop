export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/images");
  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
