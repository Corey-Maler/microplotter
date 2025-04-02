export const getRandomColor = () => {
  return `#${Math.floor(Math.random()*16777215).toString(16)}`;
}

export const getRandomDarkColor = () => {
    const r = 30 + Math.floor(Math.random() * 148);
    const g = 30 + Math.floor(Math.random() * 148);
    const b = 30 + Math.floor(Math.random() * 148);
    return `rgb(${r}, ${g}, ${b})`;
}

export const getRandomLightColor = () => {
  return `#${Math.floor(Math.random()*16777215).toString(16)}`;
}

export const getStableRandomColor = (id: number): string => {
  // Use a simple hash function to generate consistent values
  const hash = id * 2654435761; // Using golden ratio prime
  const r = 30 + (hash & 0xFF);
  const g = 30 + ((hash >> 8) & 0xFF);
  const b = 30 + ((hash >> 16) & 0xFF);
  return `rgb(${r}, ${g}, ${b})`;
}