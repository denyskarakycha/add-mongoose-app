const deleteProduct = (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const cstf = btn.parentNode.querySelector('[name=_csrf]').value; 
    
    const productElement = btn.closest('article');
    console.log(productElement);
    
    fetch('/admin/product/' + prodId, {
        method: 'DELETE',
        headers: {
            'csrf-token': cstf
        }
    }).then(result => {
        if (!result.ok) {
            throw new Error('Network response was not ok');
        }
        productElement.parentNode.removeChild(productElement);
        return result.json();
    })
    .then(data => {
        console.log(data);     
        productElement.parentNode.removeChild(productElement);
    })
    .catch(err => {
        console.log(err);
    })
};