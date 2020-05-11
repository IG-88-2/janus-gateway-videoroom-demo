export const toMapBy = (what) => (items) => {

    const itemsMap = {};

    for(let i = 0; i < items.length; i++) {
		const item = items[i];
		const value = item[what];
        itemsMap[value] = item;   
    }

    return itemsMap;

}