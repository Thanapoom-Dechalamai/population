function simpleHash(str)
{
    let hash = 0;
    for (let i = 0; i < str.length; i++)
    {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

export const getColor = (seed, cached) =>
{
    if (cached[seed])
    {
        // If the color for the given seed is already cached, return it.
        return cached[seed];
    } else
    {
        // Use the simple hash function to derive color components
        const hash = simpleHash(seed);

        const rPart = (hash & 0xFF0000) >> 16;
        const gPart = (hash & 0x00FF00) >> 8;
        const bPart = hash & 0x0000FF;

        // Construct the color string
        const color = `#${rPart.toString(16).padStart(2, '0')}${gPart.toString(16).padStart(2, '0')}${bPart.toString(16).padStart(2, '0')}`;

        // Cache the color for the seed
        cached[seed] = color;

        return color;
    }
};