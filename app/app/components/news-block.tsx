
interface NewsBlockProps {
    title: string
    content: string
    imageUrl: string
    imageLeft: boolean
    date: Date
}

export default function NewsBlock(props: NewsBlockProps) {
    const {title, content, imageUrl, imageLeft, date} = props;

    return (
        <div className="news-block" style={{flexDirection: imageLeft ? 'row' : 'row-reverse'}}>
            <img src={imageUrl} alt={title}/>
            <span>
                <p className="news-title">{title}</p>
                <p className="news-text">{content}</p>
                <p className="news-date">{date.toDateString()}</p>
            </span>
        </div>
    )
}