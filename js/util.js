// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

export function embed(video) {
    return `https://www.youtube.com/embed/${getYoutubeIdFromUrl(video)}`;
}

//test code to see if it works
export function embed(video) {
    const videoId = getYoutubeIdFromUrl(video);

    try {
        const url = new URL(video);

        // Get the timestamp if it exists
        const time = url.searchParams.get("t");

        let embedUrl = `https://www.youtube.com/embed/${videoId}`;

        if (time) {
            // Remove trailing "s" if present (e.g. t=49s)
            const seconds = parseInt(time.replace("s", ""), 10);

            if (!isNaN(seconds)) {
                embedUrl += `?start=${seconds}`;
            }
        }

        return embedUrl;
    } catch {
        return `https://www.youtube.com/embed/${videoId}`;
    }
}

export function localize(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 3 });
}

export function getThumbnailFromId(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}
