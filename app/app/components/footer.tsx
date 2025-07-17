import AddressLink from "./address-link";

export default function Footer() {

    return (
        <footer style={{display: 'grid'}}>
            <ul className="contact-list">
                <p>Test</p>
                <AddressLink />
            </ul>
        </footer>
    )
}