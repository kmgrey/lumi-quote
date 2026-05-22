import { useEffect, useState } from "react";

export const ProductImage = ({ filename }) => {
	const [imgSrc, setImgSrc] = useState(null);

	useEffect(() => {
		if (!filename) return;

		const loadImage = async () => {
			const data = await window.api.getProductImage(filename);
			setImgSrc(data);
		};
		loadImage();
	}, [filename]);

	if (!imgSrc) return <div style={{ width: 100, height: 100, background: "#eee" }}>No Image</div>;

	return <img src={imgSrc} width="100" height="100" alt="product" />;
};
