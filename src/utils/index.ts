export const LIKE_COLOR = ["#cfe8fc", "#d7acac", "#cb1212"]

export const storeLocal = (v: Object, name) => {
    localStorage[name] = JSON.stringify(v)
}
