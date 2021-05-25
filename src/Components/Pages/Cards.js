import React from 'react'

export default function Cards({link,title,children,image}) {
    return (
        <>
            <div className="property-card">
                <a href={link}>
                <div className="property-image" style={{backgroundImage:`url(${image})`}}>
                    {/* <div className="property-image-title">
                        <h5>{title}</h5> 
                    </div> */}
                </div>
                </a>
                <div className="property-description">
                    <h3> {title} </h3>
                    <p>{children}</p>
                </div>
                <a href={link}>
                    <div className="property-social-icons">
                    
                    </div>
                </a>
            </div>
        </>
    )
}
