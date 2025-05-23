// Standalone implementation of version comparison functions for testing

function parseVersionString(version) {
  return version.split('.').map(part => parseInt(part, 10) || 0);
}

function compareVersions(v1, v2) {
  const parts1 = parseVersionString(v1);
  const parts2 = parseVersionString(v2);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
}

module.exports = {
  parseVersionString,
  compareVersions
};