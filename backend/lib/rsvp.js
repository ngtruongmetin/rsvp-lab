function createChunks(text, level) {
  if (level === 4) return text.split(/(?<=[.!?])\s+/).filter(Boolean)
  return text
    .split(/\s+/)
    .reduce((groups, word, index) => {
      const size = level === 1 ? 1 : level === 2 ? 2 : 5
      if (index % size === 0) groups.push([])
      groups.at(-1).push(word)
      return groups
    }, [])
    .map((group) => group.join(" "))
}

module.exports = { createChunks }
