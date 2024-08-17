function convertMapTypeToObjectLiteral<K extends string | number | symbol, V>(
	map: Map<K, V>,
): Record<K, V> {
	const object = {} as Record<K, V>;

	map.forEach((value, key) => {
		object[key] = value;
	});

	return object;
}

export default convertMapTypeToObjectLiteral;
