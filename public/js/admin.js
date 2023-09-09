const deleteProduct = (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const cstf = btn.parentNode.querySelector('[name=_csrf]').value;   
    
    fetch('/admin/product/' + prodId, {
        method: 'DELETE',
        headers: {
            'csrf-token': cstf
        }
    }).then(result => {
        console.log(result);
    }).catch(err => {
        console.log(err);
    })
};