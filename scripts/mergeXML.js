/**
 * 
 * @param {Array} catalogs List all catalog XML values
 */
module.exports = (outputPath, catalogs) => {
    const merge = require('deepmerge');
    const fs = require('fs-extra');
    const mergedCatalog = merge.all(catalogs);

    const products = mergedCatalog[Object.keys(mergedCatalog)[0]];

    const productsMap = {};
    for (let i = 0, l = products.length; i < l; i++) {
        let product = products[i];

        if (!productsMap[product.id]) {
            mergeVariants(product);
            productsMap[product.id] = product;
        } else {
            mergeVariants(productsMap[product.id], getVariantsByProduct(product));
        }
    }

    const filename = `${Object.keys(mergedCatalog)[0]}.json`;
    const path = require('path');

    fs.writeJSON(path.join(outputPath, filename), {
        [Object.keys(mergedCatalog)[0]]: Object.values(productsMap)
    }, {
            spaces: 2,
        }).then(() => {

            const xml2js = require('xml2js');


            var builder = new xml2js.Builder();
            var xml = builder.buildObject(require(path.join(outputPath, filename)));
            
            fs.writeFile(path.join(outputPath, `${Object.keys(mergedCatalog)[0]}.xml`), xml, () => {

                console.log('done');
            });
        });

    return mergedCatalog;
};

function getVariantsByProduct(product) {
    const variants = [];
    const variantsIds = [];
    if (product.variations) {
        product.variations.forEach(variation => {
            if (variation.variants) {
                variation.variants.forEach((element) => {
                    const variant = element.variant;

                    if (variant) {
                        variant.forEach(productVariant => {
                            if (productVariant && productVariant.$ && !variantsIds.includes(productVariant.$['product-id'])) {
                                variantsIds.push(productVariant.$['product-id']);
                                variants.push(productVariant.$);
                            }
                        });

                    }
                });
            }
        });
    }
    return variants;
}

/**
 * 
 * @param {object} product 
 * @param {array|optionnal} variants List of variants
 */
function mergeVariants(product, productVariants) {
    // Quick and dirty method. Needs to be cleaned
    if (product.variations) {
        product.variations.forEach(variation => {
            if (variation.variants) {
                variation.variants.forEach((element) => {
                    const variant = element.variant;

                    if (variant) {
                        const variants = [];
                        const variantsIds = [];
                        variant.forEach(productVariant => {
                            if (productVariant && productVariant.$ && !variantsIds.includes(productVariant.$['product-id'])) {
                                variantsIds.push(productVariant.$['product-id']);
                                variants.push(productVariant.$);
                            }
                        });
                        if (productVariants) {
                            const cleanVariant = {};
                            variants.concat(productVariants).forEach(function (item) {
                                cleanVariant[item['product-id']] = item;
                            });

                            element.variant = Object.values(cleanVariant);
                        } else {
                            element.variant = variants;
                        }
                    }
                });
            }
        });
    }
}

