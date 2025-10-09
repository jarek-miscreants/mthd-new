export interface DeployItemProps {
  indexDeco: string;
  title: string;
  text?: string;
  cta?: boolean;
}

export default function DeployItem({
  indexDeco,
  title,
  text,
  cta,
}: DeployItemProps) {
  return (
    <li className="bg-dark-secondary py-xs px-xs rounded-main d:col-span-3 flex flex-col gap-xs justify-between">
      <div className="flex gap-small items-center justify-between">
        <h3 className="text-large">
          <span className="font-secondary text-neutral">{indexDeco} </span>
          {title}
        </h3>
      </div>

      {cta ? (
        <a className="btn-main-wrap is-primary" href="mailto:">
          Request Demo
        </a>
      ) : (
        <p className="leading-tight tracking-tight ">{text}</p>
      )}
    </li>
  );
}
